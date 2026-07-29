import styles from './styles.module.less';

export interface IProps {
  title: string;
  desc: string;
}

export default function SubHeader(props: IProps) {
  return (
    <div className={styles.bg}>
      <span>
        <h2>{props.title}</h2>
        <p>{props.desc}</p>
      </span>
    </div>
  );
}
