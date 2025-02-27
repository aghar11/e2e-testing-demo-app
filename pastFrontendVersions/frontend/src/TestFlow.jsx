import React, { useCallback } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
    { id: '1', position: { x: 0, y: 50 }, data: { label: 'Start' }, type: 'input' },
    { id: '2', position: { x: 200, y: 50 }, data: { label: 'Open Google' } },
    { id: '3', position: { x: 400, y: 50 }, data: { label: 'Search NHL' }, type: 'output' }
  ];
  
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }];

const TestFlow = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const runTests = async () => {
        const resonse = await fetch(`http://localhost:8000/run-test?name=openGoogle`);
        console.log(resonse);
    };

    return (
        <div style={{ height: 400 }}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
        >
            <Background />
            <Controls />
        </ReactFlow>
        <button onClick={runTests} style={{ marginTop: 20 }}>Run Tests</button>
        </div>
    );
};
  
export default TestFlow;