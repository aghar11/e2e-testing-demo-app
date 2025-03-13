import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Modular test cases definitions
const testCases = ['openGoogle', 'searchNHL', 'searchNBA', 'searchNFL'];

const FlowEditor = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeId, setNodeId] = useState(1);
    const [testDirectory, setTestDirectory] = useState([]);

    // Handle initial load of testDirectory
    useEffect(() => {
        fetch('http://localhost:8000/load-tests')
            .then((res) => res.json())
            .then((data) => setTestDirectory(data))
            .catch((error) => console.error('Error loading test cases:', error));
    }, []);

    // Handle dragging test cases onto the canvas
    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const testCase = event.dataTransfer.getData('application/reactflow');
        if (!testCase) return;

        const position = {
            x: event.clientX - 200,
            y: event.clientY - 50,
        };

        const newNode: Node = {
            id: `${nodeId}`,
            position,
            data: { label: testCase },
            type: 'default',
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeId((id) => id + 1);
    }, [nodeId, setNodes]);

    const onConnect = useCallback((connection: Edge | Connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, [setEdges]);

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    // Clear workspace
    const clearSpace = async () => {
        setNodes((nds) => []);
        setNodeId((id) => 1);
    };

    // Run connected test cases in order
    const runTestFlow = async () => {
        const testFlow = nodes.map((node) => node.data.label);
        try {
            const response = await fetch(`http://localhost:8000/run-test?flow=${testFlow.join(',')}`);
            const message = await response.text();
            alert(message);
        } catch (error) {
            alert('Failed to run test flow!');
        }
    };

    const onDragStart = (event: any, node: any) => {
        event.dataTransfer.setData('application/reactflow', node.label);
    };

    // Recursively render tree structure with draggable test cases
    const renderTree = (nodes: any) => (
        nodes.map((node: any) => (
            <TreeItem
                key={node.id}
                itemId={node.id}
                label={node.label}
                draggable={!node.children} // Only allow test cases to be draggable
                onDragStart={node.children ? undefined : (e) => onDragStart(e, node)}
            >
                {node.children ? renderTree(node.children) : null}
            </TreeItem>
        ))
    );

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <aside style={{ width: '200px', backgroundColor: '#f4f4f4', padding: '10px' }}>
                <h3>Test Case Toolbox</h3>
                <SimpleTreeView>
                    {renderTree(testDirectory)}
                </SimpleTreeView>
                {testCases.map((test) => (
                    <div
                        key={test}
                        onDragStart={(e) => e.dataTransfer.setData('application/reactflow', test)}
                        draggable
                        style={{ padding: '5px', margin: '5px', backgroundColor: '#ddd', cursor: 'grab' }}
                    >
                        {test}
                    </div>
                ))}
                <button onClick={runTestFlow} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4caf50', color: 'white' }}>
                    Run Test
                </button>

                <button onClick={clearSpace} style={{ marginTop: '20px', marginLeft: '5px', padding: '10px', backgroundColor: '#e74c3c', color: 'white' }}>
                    Clear
                </button>
            </aside>

            <div style={{ flex: 1, border: '1px solid #ddd' }} onDrop={onDrop} onDragOver={onDragOver}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </div>
    );
};

export default FlowEditor;
