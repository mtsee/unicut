export interface IconProps {
  size: number;
  color?: string;
}

export function FolderIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
    >
      <path
        d="M230.4 230.4m76.8 0l486.4 0q76.8 0 76.8 76.8l0 409.6q0 76.8-76.8 76.8l-486.4 0q-76.8 0-76.8-76.8l0-409.6q0-76.8 76.8-76.8Z"
        fill="#FFA86A"
        p-id="5062"
      ></path>
      <path
        d="M102.4 256a76.8 76.8 0 0 1 76.8-76.8h223.6672a76.8 76.8 0 0 1 73.856 55.7056L497.3568 307.2H844.8a76.8 76.8 0 0 1 76.8 76.8v409.6a76.8 76.8 0 0 1-76.8 76.8H179.2a76.8 76.8 0 0 1-76.8-76.8V256z"
        fill="#FFD977"
        p-id="5063"
      ></path>
    </svg>
  );
}
