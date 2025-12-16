import React from 'react';

const Task = ({ task, moveTask, deleteTask }) => {
    return (
        <div className="kanban-task">
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <div className="task-actions">
                <button
                    onClick={() => moveTask(task._id, -1)}
                    disabled={task.status === 'To Do'}
                >
                    ←
                </button>
                <button
                    onClick={() => deleteTask(task._id)}
                    style={{
                        marginLeft: '10px',
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    title="Supprimer la tâche"
                >
                    🗑️
                </button>
                <button
                    onClick={() => moveTask(task._id, 1)}
                    disabled={task.status === 'Done'}
                >
                    →
                </button>
            </div>
        </div>
    );
};

export default Task;
