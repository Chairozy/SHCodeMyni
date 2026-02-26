import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { KWCompileResult, buildKarelWorldToolbox, compileWorkspaceToSteps, ensureBlocklyKarelWorldRegistered, restoreWorkspace, serializeWorkspace } from '@/utils/blocklyKarelWorld';

export default function useBlocklyKarelWorldWorkspace({
  levelId,
  allowed,
  storageKey,
}: {
  levelId: number;
  allowed: {
    moveUp: boolean;
    moveRight: boolean;
    moveDown: boolean;
    moveLeft: boolean;
    pick: boolean;
    put: boolean;
    repeat: boolean;
  };
  storageKey: (levelId: number) => string;
}) {
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const levelIdRef = useRef(levelId);
  const [compile, setCompile] = useState<KWCompileResult>({ ok: true, steps: [], warnings: [] });

  useEffect(() => {
    ensureBlocklyKarelWorldRegistered();
  }, []);

  useEffect(() => {
    if (!blocklyDivRef.current) return;
    if (workspaceRef.current) return;

    const toolbox = buildKarelWorldToolbox(allowed);

    const ws = Blockly.inject(blocklyDivRef.current, {
      toolbox,
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: 0.95, maxScale: 1.3, minScale: 0.6, scaleSpeed: 1.1 },
      grid: { spacing: 20, length: 3, colour: '#1f2a44', snap: true },
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'thrasos',
      theme: Blockly.Theme.defineTheme('kw-dark', {
        name: 'kw-dark',
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#0b1220',
          toolboxBackgroundColour: '#0f172a',
          toolboxForegroundColour: '#e2e8f0',
          flyoutBackgroundColour: '#0f172a',
          flyoutForegroundColour: '#e2e8f0',
          flyoutOpacity: 1,
          scrollbarColour: '#334155',
          insertionMarkerColour: '#60a5fa',
          insertionMarkerOpacity: 0.25,
        },
      }),
    });

    workspaceRef.current = ws;
    const xmlText = localStorage.getItem(storageKey(levelIdRef.current));
    if (xmlText) {
      try {
        restoreWorkspace(ws, xmlText);
      } catch {
        ws.clear();
      }
    }

    setCompile(compileWorkspaceToSteps(ws));

    const onChange = () => {
      if (!workspaceRef.current) return;
      localStorage.setItem(storageKey(levelIdRef.current), serializeWorkspace(workspaceRef.current));
      setCompile(compileWorkspaceToSteps(workspaceRef.current));
    };
    ws.addChangeListener(onChange);

    return () => {
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [allowed, storageKey]);

  useEffect(() => {
    levelIdRef.current = levelId;
    const ws = workspaceRef.current;
    if (!ws) return;

    ws.updateToolbox(buildKarelWorldToolbox(allowed));
    const xmlText = localStorage.getItem(storageKey(levelId));
    if (xmlText) {
      try {
        restoreWorkspace(ws, xmlText);
      } catch {
        ws.clear();
      }
    } else {
      ws.clear();
    }
    setCompile(compileWorkspaceToSteps(ws));
  }, [levelId, allowed, storageKey]);

  return { blocklyDivRef, workspaceRef, compile, setCompile };
}
