import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@rs/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rs/ui/card'
import { Input } from '@rs/ui/input'
import { Field } from '@rs/ui/field'

export const Route = createFileRoute('/todos')({ component: TodoPage })

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
const TODOS_ENDPOINT = `${API_URL}/v1/todos`

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

function TodoPage() {
  const [todos, setTodos] = React.useState<Array<Todo>>([])
  const [title, setTitle] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  const fetchTodos = React.useCallback(async () => {
    try {
      const res = await fetch(TODOS_ENDPOINT)
      const data: unknown = await res.json()
      const responseData =
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as { data: unknown }).data
          : null
      const nextTodos = Array.isArray(data)
        ? data
        : Array.isArray(responseData)
          ? (responseData as Array<Todo>)
          : []
      setTodos(nextTodos)
    } catch (error) {
      console.error('Failed to fetch todos', error)
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchTodos()
  }, [fetchTodos])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await fetch(TODOS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setTitle('')
    await fetchTodos()
  }

  const handleToggle = async (todo: Todo) => {
    await fetch(`${TODOS_ENDPOINT}/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    })
    await fetchTodos()
  }

  const handleDelete = async (id: string) => {
    await fetch(`${TODOS_ENDPOINT}/${id}`, { method: 'DELETE' })
    await fetchTodos()
  }

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="bg-background min-h-screen p-6 sm:p-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground text-sm">
            {remaining} task{remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add a task</CardTitle>
            <CardDescription>Enter a title and press Add</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-2">
              <Field className="flex-1">
                <Input
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <Button type="submit" disabled={!title.trim()}>
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : todos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tasks yet. Add one above!
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                      className="accent-primary h-4 w-4 cursor-pointer rounded"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        todo.completed
                          ? 'text-muted-foreground line-through'
                          : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(todo.id)}
                      className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
