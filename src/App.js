import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Task from './components/Task';
import './App.css';

const statuses = ['To Do', 'In Progress', 'Done'];

// Use the environment variable for the API URL
// use http://localhost:5000/api/tasks/ locally
const API_URL = process.env.REACT_APP_API_URL;

function App() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'To Do',
    });

    // Fetch tasks from the backend
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axios.get(`${API_URL}`);
                console.log('Fetched tasks:', data);  // Debug log
                setTasks(data);
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        };

        fetchTasks();
    }, []);

    // Update task status
    const moveTask = async (taskId, direction) => {
        const task = tasks.find((task) => task._id === taskId);
        const currentIndex = statuses.indexOf(task.status);
        const newIndex = currentIndex + direction;

        // Ensure the new index is within bounds
        if (newIndex >= 0 && newIndex < statuses.length) {
            const updatedTask = { ...task, status: statuses[newIndex] };

            try {
                await axios.put(`${API_URL}/${taskId}`, updatedTask);
                setTasks((prevTasks) =>
                    prevTasks.map((t) =>
                        t._id === taskId ? updatedTask : t
                    )
                );
            } catch (err) {
                console.error('Error updating task:', err);
            }
        }
    };

    const deleteTask = async (taskId) => {
        // Petite sécurité pour éviter les clics accidentels
        if (!window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) return;

        try {
            // Attention au "/" comme vu précédemment !
            await axios.delete(`${API_URL}/${taskId}`);

            // Mise à jour locale (retire la tâche de la liste sans recharger la page)
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    // Handle task creation form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    // Submit the form to create a new task
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.description) return; // Ensure title and description are filled

        try {
            const { data } = await axios.post(`${API_URL}/`, newTask);
            console.log('New task added:', data); // Debug log
            setTasks((prevTasks) => [...prevTasks, data]); // Add new task to state
            setNewTask({ title: '', description: '', status: 'To Do' }); // Reset form
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Task Manager 2</h1>
            </header>
            <main className="kanban">
                {statuses.map((status) => (
                    <div key={status} className="kanban-column">
                        <h2>{status}</h2>
                        {tasks
                            .filter((task) => task.status === status)
                            .map((task) => (
                                <Task
                                    key={task._id}
                                    task={task}
                                    moveTask={moveTask}
                                    deleteTask={deleteTask}
                                />
                            ))}
                    </div>
                ))}
            </main>

            {/* Form to create new task */}
            <div className="task-form">
                <h3>Create New Task</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newTask.title}
                            onChange={handleInputChange}
                            placeholder="Task title"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            placeholder="Task description"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Status</label>
                        <select
                            name="status"
                            value={newTask.status}
                            onChange={handleInputChange}
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Create Task</button>
                </form>
            </div>
        </div>
    );
}

export default App;
