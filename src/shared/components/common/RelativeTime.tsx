"use client";

import { useEffect, useState } from "react";

import { getTimeStamp } from "@/shared/lib/utils";

interface RelativeTimeProps {
  date: Date | string;
}

const RelativeTime = ({ date }: RelativeTimeProps) => {
  const [value, setValue] = useState("recently");

  useEffect(() => {
    setValue(getTimeStamp(date));
  }, [date]);

  return <>{value}</>;
};

export default RelativeTime;