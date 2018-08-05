import ColladaLoader from 'three-collada-loader';

const colladaLoader = new ColladaLoader();

function loadModel(daeModel) {
  return new Promise(function (resolve) {
    colladaLoader.load(daeModel, collada => {
      const model = collada.scene;
      model.rotateX(3 * Math.PI / 2); // fix blender rotation
      resolve(model);
    });
  });
}

export default loadModel;
