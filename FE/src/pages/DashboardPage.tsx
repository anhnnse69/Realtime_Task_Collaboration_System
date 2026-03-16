import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Layout, List, Modal, Space, Typography, Alert, Spin, theme } from 'antd';
import { logout } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useSocketConnection } from '../socket/useSocket';
import { socket } from '../socket/socket';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const { workspaces, invitations, loadMine, loadInvitations, create, acceptInvitation, declineInvitation, loading, error } = useWorkspaceStore();
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { token } = theme.useToken();

    useEffect(() => {
        loadMine();
        loadInvitations();
    }, [loadMine, loadInvitations]);

    useSocketConnection();

    useEffect(() => {
        const onInvite = () => {
            loadInvitations();
        };

        socket.on('workspace:invite_created', onInvite);
        return () => {
            socket.off('workspace:invite_created', onInvite);
        };
    }, [loadInvitations]);

    if (!accessToken) return <Navigate to="/login" replace />;

    const onCreate = async () => {
        const n = name.trim();
        if (!n) return;
        const ws = await create(n);
        if (ws) {
            setName('');
            navigate(`/workspaces/${ws.id}`);
        }
    };

    const onAccept = (workspaceId: string, workspaceName: string) => {
        Modal.confirm({
            title: 'Join workspace?',
            content: `Do you want to join "${workspaceName}"?`,
            okText: 'Join',
            cancelText: 'Cancel',
            onOk: async () => {
                const ws = await acceptInvitation(workspaceId);
                if (ws) navigate(`/workspaces/${ws.id}`);
            },
        });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <Title level={4} style={{ margin: 0, color: token.colorTextLightSolid }}>Workspaces</Title>
                    <Text style={{ color: token.colorTextLightSolid, opacity: 0.85 }}>Signed in as {user?.email}</Text>
                </div>
                <Button onClick={logout}>Logout</Button>
            </Header>

            <Content>
                <div className="container">
                    {invitations.length > 0 && (
                        <Card style={{ marginTop: 16 }} title="Invitations">
                            <List
                                dataSource={invitations}
                                renderItem={(inv) => (
                                    <List.Item
                                        actions={[
                                            <Button type="primary" onClick={() => onAccept(inv.workspaceId, inv.workspace.name)}>
                                                Join
                                            </Button>,
                                            <Button danger onClick={() => declineInvitation(inv.workspaceId)}>
                                                Decline
                                            </Button>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={inv.workspace.name}
                                            description={`Invited at: ${new Date(inv.invitedAt).toLocaleString()}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    )}

                    <Card style={{ marginTop: 16 }}>
                        <Form layout="inline" onFinish={onCreate} style={{ width: '100%' }}>
                            <Form.Item style={{ flex: 1, minWidth: 240 }}>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="New workspace name"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Create</Button>
                            </Form.Item>
                        </Form>
                        {error && <Alert style={{ marginTop: 12 }} type="error" showIcon message={error} />}
                    </Card>

                    <Card style={{ marginTop: 16 }}>
                        {loading ? (
                            <Space style={{ width: '100%', justifyContent: 'center' }}>
                                <Spin />
                                <Text type="secondary">Loading…</Text>
                            </Space>
                        ) : workspaces.length === 0 ? (
                            <Text type="secondary">No workspaces yet.</Text>
                        ) : (
                            <List
                                dataSource={workspaces}
                                renderItem={(ws) => (
                                    <List.Item
                                        actions={[<Link to={`/workspaces/${ws.id}`}>Open</Link>]}
                                    >
                                        <List.Item.Meta
                                            title={ws.name}
                                            description={`Updated: ${new Date(ws.updatedAt).toLocaleString()}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
}
