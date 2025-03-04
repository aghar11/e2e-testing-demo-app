import React, { useCallback, useEffect, useState } from "react";
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

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const Workspace = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeId, setNodeId] = useState(1);
    const [testCases, setTestCases] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:8000/load-tests')
            .then((res) => res.json())
            .then((data) => setTestCases(data.tests))
            .catch((error) => console.error('Error loading test cases:', error));

        const eventSource = new EventSource('http://localhost:8000/events'); // Connect to SSE endpoint

        // Listen for incoming messages (new test cases)
        eventSource.onmessage = (event) => {
            const newTestCase = JSON.parse(event.data)['testName'];
            console.log(newTestCase);
            setTestCases((prevTestCases) => [...prevTestCases, newTestCase]); // Add the new test case
        };
    
        // Handle any errors
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close(); // Close the connection on error
        };
    
        // Cleanup when component unmounts
        return () => {
            eventSource.close();
            console.log('SSE connection closed');
        };
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

    const recordNewTestCase = async (event: React.FormEvent) => {
        event.preventDefault();

        // Read the form data
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        
        try {
            const response = await fetch('http://localhost:8000/start-codegen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.get("name"),
                    url: formData.get("url") }
                )
            });

            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Error generating test case:', error);
            alert('Could not generate test case.');
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <aside style={{ width: '400px', backgroundColor: '#f4f4f4', padding: '10px' }}>
                <h3>Test Case Toolbox</h3>
                {testCases && testCases.map((test) => (
                    <div
                        key={test}
                        onDragStart={(e) => e.dataTransfer.setData('application/reactflow', test)}
                        draggable
                        style={{ padding: '5px', margin: '5px', backgroundColor: '#ddd', cursor: 'grab' }}
                    >
                        {test}
                    </div>
                ))}
                <div>
                    <button onClick={runTestFlow} style={{ marginTop: '20px', padding: '10px', backgroundColor: '#4caf50', color: 'white' }}>
                        Run Test
                    </button>
                    <button onClick={clearSpace} style={{ marginTop: '20px', marginLeft: '5px', padding: '10px', backgroundColor: '#e74c3c', color: 'white' }}>
                        Clear
                    </button>
                </div>
                <h3 style={{ marginTop: '30px', paddingTop: '10px' }}>New Test Case Creation</h3>
                <form method="post" onSubmit={recordNewTestCase}>
                    <label style={{ margin: '5px'}}>
                        Test Name:
                    </label>
                    <br/>
                    <input name="name" style={{ margin: '5px', width: "95%" }}/>
                    <label style={{ margin: '5px'}}>
                        Target URL:
                    </label>
                    <br/>
                    <input name="url" style={{ margin: '5px', width: "95%" }}/>
                    <br/>
                    <button type="submit" style={{ margin: '5px', backgroundColor: '#3498DB', color: 'white' }}>Record New Test Case</button>
                </form>
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

export default Workspace;