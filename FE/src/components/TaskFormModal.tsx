import { Modal, Form, Input, Select, DatePicker, Button, Space, message } from 'antd';
import type * as taskApi from '../api/task.api';
import dayjs from 'dayjs';

interface TaskFormModalProps {
    open: boolean;
    task?: taskApi.Task | null;
    members: taskApi.User[];
    onSubmit: (data: {
        title: string;
        description?: string;
        priority?: taskApi.TaskPriority;
        dueDate?: string;
        tags?: string;
        assigneeId?: string;
    }) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function TaskFormModal({
    open,
    task,
    members,
    onSubmit,
    onCancel,
    loading = false,
}: TaskFormModalProps) {
    const [form] = Form.useForm();
    const isEditMode = !!task;

    const handleSubmit = async (values: any) => {
        try {
            await onSubmit({
                title: values.title,
                description: values.description,
                priority: values.priority || 'MEDIUM',
                dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
                tags: values.tags,
                assigneeId: values.assigneeId,
            });
            form.resetFields();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'An error occurred');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={isEditMode ? 'Edit Task' : 'Create New Task'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={
                    task
                        ? {
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
                            tags: task.tags,
                            assigneeId: task.assignee?.id,
                        }
                        : { priority: 'MEDIUM' }
                }
            >
                <Form.Item
                    name="title"
                    label="Task Title"
                    rules={[
                        { required: true, message: 'Please enter task title' },
                        { min: 1, message: 'Title cannot be empty' },
                    ]}
                >
                    <Input placeholder="Enter task title" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea
                        placeholder="Enter task description (optional)"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="Priority"
                >
                    <Select
                        options={[
                            { value: 'LOW', label: 'Low' },
                            { value: 'MEDIUM', label: 'Medium' },
                            { value: 'HIGH', label: 'High' },
                        ]}
                        placeholder="Select priority"
                    />
                </Form.Item>

                <Form.Item
                    name="assigneeId"
                    label="Assignee"
                >
                    <Select
                        placeholder="Assign to member (optional)"
                        allowClear
                        options={[
                            {
                                label: 'Unassigned',
                                value: undefined,
                            },
                            ...members.map((member) => ({
                                value: member.id,
                                label: `${member.name || member.email} ${member.email ? `(${member.email})` : ''}`,
                            })),
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="dueDate"
                    label="Due Date"
                >
                    <DatePicker placeholder="Select due date" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="tags"
                    label="Tags"
                >
                    <Input
                        placeholder="Enter tags (comma-separated, e.g., bug,urgent)"
                    />
                </Form.Item>

                <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode ? 'Update Task' : 'Create Task'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
}
