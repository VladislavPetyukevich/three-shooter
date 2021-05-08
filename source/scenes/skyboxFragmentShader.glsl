uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
#define F4 0.309016994374947451
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.0;}
float mod289(float x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
float permute(float x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float taylorInvSqrt(float r){return 1.79284291400159-.85373472095314*r;}
vec4 grad4(float j,vec4 ip){
const vec4 ones=vec4(1.,1.,1.,-1.);
vec4 p,s;
p.xyz=floor(fract (vec3(j) * ip.xyz) * 7.) * ip.z-1.;
p.w=1.5-dot(abs(p.xyz),ones.xyz);
s=vec4(lessThan(p,vec4(0.)));
p.xyz=p.xyz+(s.xyz*2.-1.)*s.www;
return p;
}
float snoise(vec4 v){
const vec4  C=vec4(.138196601125011,.276393202250021,.414589803375032,-.447213595499958);
vec4 i=floor(v+dot(v,vec4(F4)));
vec4 x0=v-i+dot(i,C.xxxx);
vec4 i0;
vec3 isX=step(x0.yzw,x0.xxx);
vec3 isYZ=step(x0.zww,x0.yyz);
i0.x=isX.x+isX.y+isX.z;
i0.yzw=1.-isX;
i0.y +=isYZ.x+isYZ.y;
i0.zw +=1.-isYZ.xy;
i0.z +=isYZ.z;
i0.w +=1.-isYZ.z;
vec4 i3=clamp(i0,0.,1.);
vec4 i2=clamp(i0-1.,0.,1.);
vec4 i1=clamp(i0-2.,0.,1.);
vec4 x1=x0-i1+C.xxxx;
vec4 x2=x0-i2+C.yyyy;
vec4 x3=x0-i3+C.zzzz;
vec4 x4=x0+C.wwww;
i=mod289(i);
float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);
vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.))+i.z+vec4(i1.z,i2.z,i3.z,1.))+i.y+vec4(i1.y,i2.y,i3.y,1.))+i.x+vec4(i1.x,i2.x,i3.x,1.));
vec4 ip=vec4(1./294.,1./49.,1./7.,0.) ;
vec4 p0=grad4(j0,ip);
vec4 p1=grad4(j1.x,ip);
vec4 p2=grad4(j1.y,ip);
vec4 p3=grad4(j1.z,ip);
vec4 p4=grad4(j1.w,ip);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));
vec3 m0=max(.6-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.);
vec2 m1=max(.6-vec2(dot(x3,x3),dot(x4,x4)),0.);
m0=m0*m0;
m1=m1*m1;
return 49.*(dot(m0*m0,vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2)))+dot(m1*m1,vec2(dot(p3,x3),dot(p4,x4))));
}
float fbm(vec4 p){float sum=0.;float amp=1.;float scale=1.;for(int i=0;i<6;i++){sum +=snoise(p*scale)*amp;p.w +=100.;amp *=0.9;scale *=2.0;}return sum;}
void main() {
float speed=.035;float scale=.00025;
vec4 p=vec4(vPosition*scale,time*speed);
float noisy=fbm(p);
vec4 color=vec4(.1);
gl_FragColor=vec4(noisy)*color;
}
