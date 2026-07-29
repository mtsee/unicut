import styles from './styles.module.less';

export interface IProps {
  title: string;
  extra?: JSX.Element;
  children?: JSX.Element | string;
}

export default function Item(props: IProps) {
  return (
    <div className={styles.item}>
      <h2 className={styles.title}>{props.title}</h2>
      <div className={styles.box}>
        <span className={styles.info}>{props.children || null}</span>
        <span className={styles.extra}>{props.extra || null}</span>
      </div>
    </div>
  );
}
