import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Input, Layout, Row, Space, Typography, notification, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import * as taskApi from '../api/task.api';
import * as workspaceApi from '../api/workspace.api';
import { socket } from '../socket/socket';
import { useSocketConnection } from '../socket/useSocket';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskCard } from '../components/TaskCard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type RealtimePayload<T> = T & { meta?: { eventId?: string; workspaceId?: string } };

export default function WorkspacePage() {
    const { workspaceId } = useParams();
    const wsId = workspaceId!;

    const accessToken = useAuthStore((s) => s.accessToken);
    const me = useAuthStore((s) => s.user);
    if (!accessToken) return <Navigate to="/login" replace />;

    useSocketConnection();

    const tasks = useTaskStore((s) => s.tasksByWorkspace[wsId] ?? []);
    const setTasks = useTaskStore((s) => s.setTasks);
    const upsertTask = useTaskStore((s) => s.upsertTask);
    const removeTask = useTaskStore((s) => s.removeTask);
    const markEventSeen = useTaskStore((s) => s.markEventSeen);

    const [inviteEmail, setInviteEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<taskApi.User[]>([]);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<taskApi.Task | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const { token } = theme.useToken();

    const grouped = useMemo(() => {
        const by: Record<taskApi.TaskStatus, taskApi.Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
        for (const t of tasks) by[t.status].push(t);
        for (const k of Object.keys(by) as taskApi.TaskStatus[]) {
            by[k].sort((a, b) => a.position - b.position);
        }
        return by;
    }, [tasks]);

    // Load tasks
    useEffect(() => {
        let alive = true;

        (async () => {
            setError(null);
            try {
                const items = await taskApi.listTasks(wsId);
                if (!alive) return;
                setTasks(wsId, items);
            } catch (e: any) {
                setError(e?.message ?? 'Failed to load tasks');
            }
        })();

        return () => {
            alive = false;
        };
    }, [wsId, setTasks]);

    // Load workspace members for assignee dropdown
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const members = await workspaceApi.getWorkspaceMembers(wsId);
                if (!alive) return;
                setMembers(members);
            } catch (e: any) {
                console.error('Failed to load members', e);
            }
        })();

        return () => {
            alive = false;
        };
    }, [wsId]);

    // WebSocket events
    useEffect(() => {
        const join = () => {
            socket.emit('join-workspace', { workspaceId: wsId });
        };

        const onCreated = (payload: RealtimePayload<{ task: taskApi.Task }>) => {
            const metaWsId = payload.meta?.workspaceId;
            if (metaWsId && metaWsId !== wsId) return;
            const eventId = payload.meta?.eventId;
            if (eventId && !markEventSeen(eventId)) return;
            upsertTask(wsId, payload.task);
        };

        const onUpdated = (payload: RealtimePayload<{ task: taskApi.Task }>) => {
            const metaWsId = payload.meta?.workspaceId;
            if (metaWsId && metaWsId !== wsId) return;
            const eventId = payload.meta?.eventId;
            if (eventId && !markEventSeen(eventId)) return;
            upsertTask(wsId, payload.task);
        };

        const onDeleted = (payload: RealtimePayload<{ taskId: string }>) => {
            const metaWsId = payload.meta?.workspaceId;
            if (metaWsId && metaWsId !== wsId) return;
            const eventId = payload.meta?.eventId;
            if (eventId && !markEventSeen(eventId)) return;
            removeTask(wsId, payload.taskId);
        };

        const onMemberJoined = (payload: RealtimePayload<{ user?: { id: string; email: string; name?: string | null } }>) => {
            const metaWsId = payload.meta?.workspaceId;
            if (metaWsId && metaWsId !== wsId) return;

            const joinedUser = payload.user;
            if (!joinedUser) return;
            if (me?.id && joinedUser.id === me.id) return;

            notification.info({
                message: 'Member joined',
                description: joinedUser.email ?? 'A member joined the workspace',
                placement: 'bottomRight',
            });
        };

        if (socket.connected) join();
        socket.on('connect', join);
        socket.on('task:created', onCreated);
        socket.on('task:updated', onUpdated);
        socket.on('task:deleted', onDeleted);
        socket.on('workspace:member_joined', onMemberJoined);

        return () => {
            socket.emit('leave-workspace', { workspaceId: wsId });
            socket.off('connect', join);
            socket.off('task:created', onCreated);
            socket.off('task:updated', onUpdated);
            socket.off('task:deleted', onDeleted);
            socket.off('workspace:member_joined', onMemberJoined);
        };
    }, [wsId, upsertTask, removeTask, markEventSeen, me?.id]);

    const handleCreateTask = async (data: {
        title: string;
        description?: string;
        priority?: taskApi.TaskPriority;
        dueDate?: string;
        tags?: string;
        assigneeId?: string;
    }) => {
        setFormLoading(true);
        try {
            await taskApi.createTask(wsId, data);
            setFormModalOpen(false);
            setEditingTask(null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Create failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditTask = async (data: {
        title: string;
        description?: string;
        priority?: taskApi.TaskPriority;
        dueDate?: string;
        tags?: string;
        assigneeId?: string;
    }) => {
        if (!editingTask) return;
        setFormLoading(true);
        try {
            await taskApi.updateTask(wsId, editingTask.id, { ...data, expectedVersion: editingTask.version });
            setFormModalOpen(false);
            setEditingTask(null);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Update failed');
        } finally {
            setFormLoading(false);
        }
    };

    const changeStatus = async (task: taskApi.Task, status: taskApi.TaskStatus) => {
        try {
            await taskApi.updateTask(wsId, task.id, { status, expectedVersion: task.version });
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Update failed');
        }
    };

    const deleteTask = async (task: taskApi.Task) => {
        try {
            await taskApi.deleteTask(wsId, task.id);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Delete failed');
        }
    };

    const invite = async () => {
        const email = inviteEmail.trim();
        if (!email) return;
        try {
            await workspaceApi.inviteMember(wsId, email);
            setInviteEmail('');
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Invite failed');
        }
    };

    const openCreateModal = () => {
        setEditingTask(null);
        setFormModalOpen(true);
    };

    const openEditModal = (task: taskApi.Task) => {
        setEditingTask(task);
        setFormModalOpen(true);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0, color: token.colorTextLightSolid }}>Workspace</Title>
                <Link to="/" style={{ color: token.colorTextLightSolid }}>← Back</Link>
            </Header>

            <Content>
                <div className="container">
                    {error && (
                        <Alert
                            style={{ marginTop: 16 }}
                            type="error"
                            showIcon
                            message={error}
                            closable
                            onClose={() => setError(null)}
                        />
                    )}

                    <Card style={{ marginTop: 16 }}>
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                                Create Task
                            </Button>
                            <Text type="secondary">Create new task with all details</Text>
                        </Space>
                    </Card>

                    <Card style={{ marginTop: 16 }} title="Invite member">
                        <Form layout="inline" onFinish={invite} style={{ width: '100%' }}>
                            <Form.Item style={{ flex: 1, minWidth: 240 }}>
                                <Input
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Invite member by email"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button htmlType="submit">Invite</Button>
                            </Form.Item>
                        </Form>
                        <Text type="secondary">Only OWNER can invite.</Text>
                    </Card>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        {(['TODO', 'IN_PROGRESS', 'DONE'] as taskApi.TaskStatus[]).map((status) => (
                            <Col key={status} xs={24} md={8}>
                                <Card
                                    title={
                                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                            <span>{status}</span>
                                            <Text type="secondary">{grouped[status].length}</Text>
                                        </Space>
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {grouped[status].map((t) => (
                                            <TaskCard
                                                key={t.id}
                                                task={t}
                                                onEdit={openEditModal}
                                                onDelete={deleteTask}
                                                onStatusChange={changeStatus}
                                            />
                                        ))}
                                        {grouped[status].length === 0 && (
                                            <Text type="secondary" style={{ textAlign: 'center', display: 'block', padding: '16px 0' }}>
                                                No tasks
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>

            <TaskFormModal
                open={formModalOpen}
                task={editingTask}
                members={members}
                onSubmit={editingTask ? handleEditTask : handleCreateTask}
                onCancel={() => {
                    setFormModalOpen(false);
                    setEditingTask(null);
                }}
                loading={formLoading}
            />
        </Layout>
    );
}
