import React, { useEffect, useRef } from 'react';

type Release = () => void;

interface Props {
  setContainer: (tag: string, ref: HTMLElement) => Release;
}

export default function ViewPort(props: Props) {
  const ref = useRef(null);
  useEffect(() => {
    return props.setContainer('main', ref.current!);
  }, [props.setContainer]);
  return <div ref={ref}></div>
}
