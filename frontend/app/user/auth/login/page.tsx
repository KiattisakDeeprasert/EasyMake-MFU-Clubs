"use client";

import { GoogleDomainLogin } from "@/components/user/auth/GoogleDomainLogin";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1 className="text-2xl font-semibold text-center" variants={item}>
          Sign in with MFU Email
        </motion.h1>

        <motion.p className="text-center text-sm text-gray-500 mt-2" variants={item}>
          Only emails ending with <span className="font-medium">@lamduan.mfu.ac.th</span> are allowed.
        </motion.p>

        <motion.div className="mt-8 flex justify-center" variants={item}>
          <GoogleDomainLogin allowedDomain="lamduan.mfu.ac.th" onSuccessRoute="/user" />
        </motion.div>

        <motion.div className="mt-8 text-center text-xs text-gray-500" variants={item}>
          Already have an account? <Link href="/user" className="underline text-black font-bold hover:text-gray-600 transition-colors">Go to home page</Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
