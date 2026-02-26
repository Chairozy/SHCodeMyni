import * as Blockly from 'blockly/core';

export type KWStepType = 'move_up' | 'move_right' | 'move_down' | 'move_left' | 'pick' | 'put';

export type KWStep = { type: KWStepType };

export type KWCompileResult =
  | { ok: true; steps: KWStep[]; warnings: string[] }
  | { ok: false; error: string };

let registered = false;

export function ensureBlocklyKarelWorldRegistered() {
  if (registered) return;
  registered = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'kw_move_up',
      message0: 'move up',
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: 'kw_move_right',
      message0: 'move right',
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: 'kw_move_down',
      message0: 'move down',
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: 'kw_move_left',
      message0: 'move left',
      previousStatement: null,
      nextStatement: null,
      colour: 210,
    },
    {
      type: 'kw_pick',
      message0: 'pick ball',
      previousStatement: null,
      nextStatement: null,
      colour: 35,
    },
    {
      type: 'kw_put',
      message0: 'put ball',
      previousStatement: null,
      nextStatement: null,
      colour: 35,
    },
    {
      type: 'kw_repeat',
      message0: 'repeat %1 times',
      args0: [
        {
          type: 'field_dropdown',
          name: 'TIMES',
          options: [
            ['2', '2'],
            ['3', '3'],
            ['4', '4'],
            ['5', '5'],
            ['6', '6'],
          ],
        },
      ],
      message1: 'do %1',
      args1: [
        {
          type: 'input_statement',
          name: 'DO',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 270,
    },
  ]);
}

export function buildKarelWorldToolbox(allowed: {
  moveUp: boolean;
  moveRight: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  pick: boolean;
  put: boolean;
  repeat: boolean;
}) {
  const contents: Blockly.utils.toolbox.ToolboxItemInfo[] = [];

  if (allowed.moveUp) contents.push({ kind: 'block', type: 'kw_move_up' });
  if (allowed.moveRight) contents.push({ kind: 'block', type: 'kw_move_right' });
  if (allowed.moveDown) contents.push({ kind: 'block', type: 'kw_move_down' });
  if (allowed.moveLeft) contents.push({ kind: 'block', type: 'kw_move_left' });

  if (allowed.pick || allowed.put || allowed.repeat) contents.push({ kind: 'sep' });
  if (allowed.pick) contents.push({ kind: 'block', type: 'kw_pick' });
  if (allowed.put) contents.push({ kind: 'block', type: 'kw_put' });

  if (allowed.repeat) {
    contents.push({ kind: 'sep' });
    contents.push({ kind: 'block', type: 'kw_repeat' });
  }

  return {
    kind: 'flyoutToolbox',
    contents,
  } satisfies Blockly.utils.toolbox.ToolboxInfo;
}

const compileChain = (start: Blockly.Block | null, out: KWStep[], budget: { left: number }) => {
  let b: Blockly.Block | null = start;
  while (b) {
    if (budget.left <= 0) throw new Error('Program terlalu panjang.');

    const t = b.type;
    if (t === 'kw_move_up') {
      out.push({ type: 'move_up' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_move_right') {
      out.push({ type: 'move_right' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_move_down') {
      out.push({ type: 'move_down' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_move_left') {
      out.push({ type: 'move_left' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_pick') {
      out.push({ type: 'pick' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_put') {
      out.push({ type: 'put' });
      budget.left--;
      b = b.getNextBlock();
      continue;
    }
    if (t === 'kw_repeat') {
      const times = Number.parseInt(b.getFieldValue('TIMES') || '2', 10);
      const body = b.getInputTargetBlock('DO');
      for (let i = 0; i < times; i++) {
        compileChain(body, out, budget);
      }
      b = b.getNextBlock();
      continue;
    }

    throw new Error(`Block tidak dikenali: ${t}`);
  }
};

export function compileWorkspaceToSteps(workspace: Blockly.Workspace): KWCompileResult {
  try {
    const top = workspace.getTopBlocks(true);
    const warnings: string[] = [];
    if (top.length === 0) return { ok: true, steps: [], warnings };
    if (top.length > 1) warnings.push('Ada lebih dari satu blok utama. Eksekusi mengikuti urutan posisi atas.');
    const steps: KWStep[] = [];
    const budget = { left: 600 };

    const sorted = [...top].sort((a, b) => {
      const pa = a.getRelativeToSurfaceXY();
      const pb = b.getRelativeToSurfaceXY();
      if (pa.y !== pb.y) return pa.y - pb.y;
      return pa.x - pb.x;
    });

    for (const root of sorted) {
      compileChain(root, steps, budget);
    }
    return { ok: true, steps, warnings };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal compile program.' };
  }
}

export function serializeWorkspace(workspace: Blockly.Workspace) {
  return JSON.stringify(Blockly.serialization.workspaces.save(workspace));
}

export function restoreWorkspace(workspace: Blockly.Workspace, xmlText: string) {
  const data = JSON.parse(xmlText);
  workspace.clear();
  Blockly.serialization.workspaces.load(data, workspace);
}
