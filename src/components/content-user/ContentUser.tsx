import styles from './styles.module.less';
export interface IProps {
  title: string;
  children?: JSX.Element;
}

function ContentUser(props: IProps) {
  return (
    <div className={styles.content}>
      <div className={styles.title}>
        <h1>{props.title}</h1>
      </div>
      <div className={styles.contents}>{props.children}</div>
    </div>
  );
}

export default ContentUser;
