import React from "react";
import s from "./Header.module.scss";
import Link from "next/link";

export default function Header() {
  return (
    <div className={s.header}>
      <Link href={"/"}>
        <img
          src="https://s3.eu-north-1.amazonaws.com/exclusivenedbucket/9dc4850a-0e9d-486c-bc80-fc3fed0c5c4e.png"
          alt="ss"
        />
      </Link>
    </div>
  );
}
