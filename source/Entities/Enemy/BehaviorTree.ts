import { Enemy } from './Enemy';
import { EnemyBehavior } from './EnemyBehavior';

export type FunctionNode =
  (behavior: EnemyBehavior, delta: number, enemy: Enemy) => boolean;

export interface ControlFlowNode {
  condition: FunctionNode;
  nodeTrue: BehaviorTreeNode;
  nodeFalse?: BehaviorTreeNode;
}

export interface SequenceNode {
  sequence: BehaviorTreeNode[];
}

export type BehaviorTreeNode =
  ControlFlowNode |
  SequenceNode |
  FunctionNode;

export class BehaviorTree {
  constructor(
    private root: BehaviorTreeNode,
    private enemyBehavior: EnemyBehavior,
    private enemy: Enemy,
  ) { }

  updateFunctionNode(node: FunctionNode, delta: number) {
    return node(this.enemyBehavior, delta, this.enemy);
  }

  updateControlFlowNode(node: ControlFlowNode, delta: number): boolean {
    const condition = this.updateFunctionNode(node.condition, delta);
    const nodeToUpdate = condition ? node.nodeTrue : node.nodeFalse;
    if (!nodeToUpdate) {
      return true;
    }
    return this.updateNode(nodeToUpdate, delta);
  }

  updateSequenceNode(node: SequenceNode, delta: number): boolean {
    for (const child of node.sequence) {
      const result = this.updateNode(child, delta);
      if (!result) {
        return false;
      }
    }
    return true;
  }

  updateNode(node: BehaviorTreeNode, delta: number) {
    if (typeof node === 'function') {
      return this.updateFunctionNode(node, delta);
    }
    if ('condition' in node) {
      return this.updateControlFlowNode(node, delta);
    }
    if ('sequence' in node) {
      return this.updateSequenceNode(node, delta);
    }
    throw new Error(`Unexpected node: ${JSON.stringify(node)}`);
  }

  update(delta: number) {
    this.updateNode(this.root, delta);
  }
}

