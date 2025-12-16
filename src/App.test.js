import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Mock axios BEFORE importing App
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock environment variable
const originalEnv = process.env;
beforeAll(() => {
  process.env = { ...originalEnv, REACT_APP_API_URL: 'http://localhost:5000/api/tasks' };
});

afterAll(() => {
  process.env = originalEnv;
});

beforeEach(()=> {
    jest.clearAllMocks();
})

test('renders Task Manager header', async () => {
  // Mock axios.get to return an empty array
  axios.get.mockResolvedValue({ data: [] });

  render(<App />);
  
  // Wait for the component to render and check for the header
  const headerElement = await screen.findByText(/Task Manager/i);
  expect(headerElement).toBeInTheDocument();
});

test('fetches and displays tasks from API', async () => {
    const mockTasks = [
        { _id: '1', title: 'Task A', description: 'Description A', status: 'To Do'},
        { _id: '1', title: 'Task B', description: 'Description B', status: 'Done'},
    ];
    axios.get.mockResolvedValue({ data: mockTasks });

    render(<App />);

    //Attend que les tâches apparaissent
    await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
    });
});

test('creates a new task via the form', async() => {
    const newTask = {
        _id: '3',
        title: 'New Task',
        description: 'New Description',
        status: 'To Do',
    };

    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: newTask });

    render(<App />);

    // Remplir le formulaire
    await userEvent.type(screen.getByPlaceholderText(/Task title/i), 'New Task');
    await userEvent.type(screen.getByPlaceholderText(/Task description/i), 'New Description');

    // Soumettre
    fireEvent.submit(screen.getByRole('button', {name: /Create Task/i}));

    // Vérifie que la tâche est affichée après avoir soumis
    await waitFor(() => {
        expect(screen.getByText('New Task')).toBeInTheDocument();
    });
});

test('updates a task when moveStack is called', async() => {
    const mockTasks = [
        { _id: '1', title: 'Task A', description: 'Description A', status: 'To Do'},
    ];

    axios.get.mockResolvedValue({ data: mockTasks });
    axios.put.mockResolvedValue({
        data: { ...mockTasks[0], status: 'In Progress' },
    });

    render(<App />);

    // Attend que la tâche apparaisse
    const taskElement = await screen.findByText('Task A');
    expect(taskElement).toBeInTheDocument();

    // Simule un clic sur le bouton "->" (simule un changement de colonne)
    const rightButton = screen.getByRole('button', { name: /→/i });
    fireEvent.click(rightButton);

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalled();
    });
});

test('handles API fetch error gracefully', async() => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    //Espionne console.error pour éviter un log bruyant dans les tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching tasks:'), expect.any(Error));
    });

    consoleSpy.mockRestore();
})