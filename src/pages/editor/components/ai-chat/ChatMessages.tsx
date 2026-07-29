import { Button, Image, Tooltip, Popconfirm } from '@douyinfe/semi-ui';
import { Copy, AddThree, Delete, Undo } from '@icon-park/react';
import ReactMarkdown from 'react-markdown';
import styles from './ai-chat.module.less';

// ==================== 类型定义 ====================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  createAt: number;
  content: string | MediaContent[];
  status?: 'loading' | 'completed' | 'error';
}

export interface MediaContent {
  type: 'text' | 'image' | 'video';
  text?: string;
  image_url?: string;
  video_url?: string;
  file_id?: string;
}

// ==================== Props ====================

interface MediaActionsProps {
  copyUrl: string;
  insertUrl: string;
  onCopyUrl: (url: string) => void;
  onInsert: (url: string) => void;
  onDelete: () => void;
}

const MediaActions = ({ copyUrl, insertUrl, onCopyUrl, onInsert, onDelete }: MediaActionsProps) => (
  <div className={styles.chatMediaActions}>
    <Tooltip content="复制">
      <Button
        size="small"
        icon={<Copy size={14} />}
        onClick={() => onCopyUrl(copyUrl)}
        theme="borderless"
        className={styles.mediaActionBtn}
      />
    </Tooltip>
    <Tooltip content="插入画布">
      <Button
        size="small"
        type="primary"
        icon={<AddThree size={14} />}
        onClick={() => onInsert(insertUrl)}
        theme="borderless"
        className={styles.mediaActionBtn}
      />
    </Tooltip>
    <Tooltip content="删除">
      <Popconfirm
        title="确认删除"
        content="确定要删除这条消息吗？"
        onConfirm={onDelete}
        position="top"
      >
        <Button
          size="small"
          type="danger"
          icon={<Delete size={14} />}
          theme="borderless"
          className={styles.mediaActionBtn}
        />
      </Popconfirm>
    </Tooltip>
  </div>
);

export interface ChatMessagesProps {
  messages: ChatMessage[];
  roleConfig: {
    user: { name: string; avatar: string };
    assistant: { name: string; avatar: string };
  };
  chatListRef: React.RefObject<HTMLDivElement | null>;
  onCopyUrl: (url: string) => void;
  onInsertImage: (url: string) => void;
  onInsertVideo: (url: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onCopyMessage: (msg: ChatMessage) => void;
  onUndoMessage: (msg: ChatMessage) => void;
}

// ==================== 组件 ====================

export default function ChatMessages({
  messages,
  roleConfig,
  chatListRef,
  onCopyUrl,
  onInsertImage,
  onInsertVideo,
  onDeleteMessage,
  onCopyMessage,
  onUndoMessage,
}: ChatMessagesProps) {
  /** 从消息中提取媒体URL并去掉域名前缀 */
  const getRawUrl = (mediaUrl: string) => mediaUrl.replace(/^https?:\/\/[^/]+/, '');

  return (
    <div className={styles.chatMessages} ref={chatListRef}>
      {messages.map(message => (
        <div
          key={message.id}
          className={`${styles.chatMessage} ${message.role === 'user' ? styles.chatMessageUser : styles.chatMessageAssistant}`}
        >
          {/* 头像 */}
          <div className={styles.chatAvatar}>
            <img
              src={
                message.role === 'user'
                  ? roleConfig.user.avatar
                  : roleConfig.assistant.avatar
              }
              alt=""
            />
          </div>

          {/* 消息内容 */}
          <div className={styles.chatBubble}>
            {/* 加载状态 */}
            {message.status === 'loading' && (
              <div className={styles.chatLoadingDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            )}

            {/* 文本消息 */}
            {typeof message.content === 'string' && message.status !== 'loading' && (
              <div className={styles.chatText}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* 媒体消息（图片 / 视频） */}
            {Array.isArray(message.content) && (
              <div className={styles.chatMediaList}>
                {/* 文本块 */}
                {message.content
                  .filter(item => item.type === 'text')
                  .map((item, idx) => (
                    <div key={idx} className={styles.chatText}>
                      <ReactMarkdown>{item.text || ''}</ReactMarkdown>
                    </div>
                  ))}

                {/* 图片块 */}
                {message.content
                  .filter(item => item.type === 'image' && item.image_url)
                  .map((item, idx) => (
                    <div key={idx} className={styles.chatMediaItem}>
                      <Image
                        src={item.image_url}
                        alt="AI生成图片"
                        width={221}
                        className={styles.chatImage}
                        preview={true}
                      />
                      <MediaActions
                        copyUrl={item.image_url!}
                        insertUrl={getRawUrl(item.image_url!)}
                        onCopyUrl={onCopyUrl}
                        onInsert={onInsertImage}
                        onDelete={() => onDeleteMessage(message.id)}
                      />
                    </div>
                  ))}

                {/* 视频块 */}
                {message.content
                  .filter(item => item.type === 'video' && (item.video_url || item.image_url))
                  .map((item, idx) => {
                    const src = item.video_url || item.image_url!;
                    const rawUrl = getRawUrl(src);
                    return (
                    <div key={idx} className={styles.chatMediaItem}>
                      <video
                        src={src}
                        controls
                        className={styles.chatVideo}
                        playsInline
                        preload="metadata"
                      />
                      <MediaActions
                        copyUrl={src}
                        insertUrl={rawUrl}
                        onCopyUrl={onCopyUrl}
                        onInsert={onInsertVideo}
                        onDelete={() => onDeleteMessage(message.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {/* 消息操作按钮（媒体消息已有各自的操作按钮，此处不再重复） */}
            {message.status !== 'loading' && typeof message.content === 'string' && (
              <div className={`${styles.messageActionRow} ${message.role === 'user' ? styles.messageActionRowRight : styles.messageActionRowLeft}`}>
                <Tooltip content="复制内容">
                  <Button
                    size="small"
                    icon={<Copy size={14} />}
                    theme="borderless"
                    onClick={() => onCopyMessage(message)}
                    className={styles.messageActionBtn}
                  />
                </Tooltip>
                <Tooltip content="删除消息">
                  <Popconfirm
                    title="确认删除"
                    content="确定要删除这条消息吗？"
                    onConfirm={() => onDeleteMessage(message.id)}
                    position={message.role === 'user' ? 'bottomRight' : 'bottomLeft'}
                  >
                    <Button
                      size="small"
                      type="danger"
                      icon={<Delete size={14} />}
                      theme="borderless"
                      className={styles.messageActionBtn}
                    />
                  </Popconfirm>
                </Tooltip>
                {/* 只对用户发送的消息显示撤销按钮 */}
                {message.role === 'user' && (
                  <Tooltip content="撤销对话">
                    <Button
                      size="small"
                      icon={<Undo size={14} />}
                      theme="borderless"
                      onClick={() => onUndoMessage(message)}
                      className={styles.messageActionBtn}
                    />
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
