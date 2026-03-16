import { Card, Space, Button, Tag, Tooltip, Badge, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import type * as taskApi from '../api/task.api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface TaskCardProps {
    task: taskApi.Task;
    onEdit: (task: taskApi.Task) => void;
    onDelete: (task: taskApi.Task) => void;
    onStatusChange: (task: taskApi.Task, status: taskApi.TaskStatus) => void;
}

const PRIORITY_COLORS: Record<taskApi.TaskPriority, string> = {
    LOW: 'blue',
    MEDIUM: 'orange',
    HIGH: 'red',
};

const PRIORITY_LABELS: Record<taskApi.TaskPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};

const STATUS_COLORS: Record<taskApi.TaskStatus, string> = {
    TODO: 'default',
    IN_PROGRESS: 'processing',
    DONE: 'success',
};

const STATUS_LABELS: Record<taskApi.TaskStatus, string> = {
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    DONE: 'Done',
};

const TAG_COLORS = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'cyan',
    'blue',
    'geekblue',
    'purple',
];

export function TaskCard({
    task,
    onEdit,
    onDelete,
    onStatusChange,
}: TaskCardProps) {
    const daysUntilDue = task.dueDate ? dayjs(task.dueDate).diff(dayjs(), 'day') : null;
    const isDueToday = task.dueDate && dayjs(task.dueDate).isSame(dayjs(), 'day');
    const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
    const isDueSoon = task.dueDate && daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 3;

    const getDueDateColor = () => {
        if (isOverdue) return 'red';
        if (isDueToday) return 'orange';
        if (isDueSoon) return 'gold';
        return undefined;
    };

    const tags = task.tags ? task.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
    
    const getTagColor = (index: number) => {
        return TAG_COLORS[index % TAG_COLORS.length];
    };

    return (
        <Card
            size="small"
            style={{ marginBottom: 12 }}
            hoverable
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* Header with title and actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 14 }}>
                            {task.title}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                            <Tag color={PRIORITY_COLORS[task.priority]} style={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                ◆ {PRIORITY_LABELS[task.priority]}
                            </Tag>
                        </div>
                    </div>
                    <Space size="small">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(task)}
                            title="Edit task"
                        />
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete(task)}
                            title="Delete task"
                        />
                    </Space>
                </div>

                {/* Description */}
                {task.description && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        {task.description}
                    </Text>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <Space size="small" wrap>
                        {tags.map((tag, index) => (
                            <Tag key={tag} color={getTagColor(index)} style={{ fontSize: 11 }}>
                                {tag}
                            </Tag>
                        ))}
                    </Space>
                )}

                {/* Assignee and Due Date */}
                <Space size="small" style={{ width: '100%' }} wrap>
                    {task.assignee && (
                        <Tooltip title={task.assignee.email}>
                            <Badge
                                count={<UserOutlined style={{ fontSize: 10, padding: 2 }} />}
                                style={{ backgroundColor: '#1890ff' }}
                            >
                                <span style={{ fontSize: 12, padding: '2px 8px', display: 'inline-block' }}>
                                    {task.assignee.name || task.assignee.email.split('@')[0]}
                                </span>
                            </Badge>
                        </Tooltip>
                    )}
                    {task.dueDate && (
                        <Tooltip title={`Due: ${dayjs(task.dueDate).format('DD/MM/YYYY')}`}>
                            <div style={{ fontSize: 12, color: getDueDateColor() }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {isDueToday
                                    ? 'Due today'
                                    : isOverdue
                                        ? `${Math.abs(daysUntilDue!)} days overdue`
                                        : `Due in ${daysUntilDue} days`}
                            </div>
                        </Tooltip>
                    )}
                </Space>

                {/* Status and Version */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Space size="small">
                        <Tag color={STATUS_COLORS[task.status]} style={{ marginRight: 0, cursor: 'pointer' }}>
                            <select
                                value={task.status}
                                onChange={(e) => onStatusChange(task, e.target.value as taskApi.TaskStatus)}
                                style={{
                                    padding: '2px 4px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'inherit',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="TODO">{STATUS_LABELS.TODO}</option>
                                <option value="IN_PROGRESS">{STATUS_LABELS.IN_PROGRESS}</option>
                                <option value="DONE">{STATUS_LABELS.DONE}</option>
                            </select>
                        </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        v{task.version}
                    </Text>
                </div>
            </Space>
        </Card>
    );
}
