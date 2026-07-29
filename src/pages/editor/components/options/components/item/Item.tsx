import styles from './item.module.less';
import classNames from 'classnames';

export interface IProps {
  title: string | JSX.Element; // 标题
  children?: any; // 子元素
  className?: string; // 自定义class名称
  extra?: any; // 标题右侧的元素模块
  style?: Record<string, any>; // 自定义style样式
}

export default function Item(props: IProps) {
  const { className, title, children, extra, style } = props;
  return (
    <div className={classNames(styles.item, className)} style={{ ...(style || {}) }}>
      <h2>
        <span>{title}</span>
        {extra}
      </h2>
      <div className={styles.content}>{children ? children : null}</div>
    </div>
  );
}
