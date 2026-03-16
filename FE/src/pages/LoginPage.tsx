import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Layout, theme } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { login, register } from '../api/auth.api';

const { Title, Text } = Typography;
const { Content } = Layout;

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null);
        try {
            if (mode === 'login') {
                await login(values.email, values.password);
            } else {
                await register(values.email, values.password, values.name);
            }
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, background: token.colorBgLayout }}>
                <Card style={{ width: 400 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 0 }}>Task Collaboration</Title>
                        <Text type="secondary">{mode === 'login' ? 'Chào mừng quay trở lại!' : 'Tạo tài khoản mới'}</Text>
                    </div>

                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                    {mode === 'register' && (
                        <Form.Item name="name" label="Tên hiển thị">
                            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                        </Form.Item>
                    )}

                    <Form.Item 
                        name="email" 
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="you@example.com" />
                    </Form.Item>

                    <Form.Item 
                        name="password" 
                        label="Mật khẩu"
                        rules={[{ required: true, min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} size="large">
                            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                        </Button>
                    </Form.Item>
                </Form>

                    <div style={{ textAlign: 'center' }}>
                        <Button type="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                            {mode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                        </Button>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
}