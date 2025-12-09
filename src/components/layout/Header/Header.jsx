import React from "react";
import s from "./Header.module.scss";
import Link from "next/link";

export default function Header() {
  return (
    <div className={s.header}>
      <Link href={"/"}>
        <img
          src="https://s3.eu-north-1.amazonaws.com/exclusivenedbucket/b1fe3967-a65c-4aa2-80a7-e571ac46258e.png"
          alt="ss"
        />
      </Link>
    </div>
  );
}
