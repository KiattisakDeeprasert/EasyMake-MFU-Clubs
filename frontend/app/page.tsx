"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const btnVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { 
    y: -4, 
    scale: 1.03, 
    transition: { duration: 0.2, ease: "easeOut" } 
  },
  tap: { scale: 0.97 },
};

const iconVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  show: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
};

export default function HomePage() {
  const router = useRouter();
  const [pending, setPending] = useState<null | "user" | "admin">(null);

  useEffect(() => {
    router.prefetch("/user");
    router.prefetch("/admin/login");
  }, [router]);

  const go = (path: "/user" | "/admin/login", who: "user" | "admin") => {
    setPending(who);
    router.push(path);
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="relative flex flex-col items-center justify-center min-h-screen text-center p-4 sm:p-6 md:p-8 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl w-full"
      >
        {/* Logo */}
        <motion.div
          variants={iconVariants}
          className="flex justify-center mb-4 sm:mb-5 md:mb-6"
        >
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 drop-shadow-2xl">
            <Image
              src="/brand-icon.png"
              alt="MFU Clubs Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#1e3a5f] via-[#2b4a7c] to-[#3d5a8f] bg-clip-text text-transparent"
        >
          Welcome to EasyMake
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-[#1e3a5f]"
        >
          MFU Clubs 🎉
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4 leading-relaxed"
        >
          Manage, explore, and join MFU clubs all in one place.
          <br className="hidden sm:block" />
          Choose your portal below to continue your journey.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
        >
          <motion.button
            variants={btnVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => router.prefetch("/user")}
            onClick={() => go("/user", "user")}
            disabled={pending !== null}
            className="w-full sm:w-auto min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#1e3a5f] to-[#2b4a7c] text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-[#1e3a5f]/30 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
          >
            <span className="flex items-center justify-center gap-2">
              {pending === "user" ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opening...
                </>
              ) : (
                <>
                  User Portal
                </>
              )}
            </span>
          </motion.button>

          <motion.button
            variants={btnVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => router.prefetch("/admin/login")}
            onClick={() => go("/admin/login", "admin")}
            disabled={pending !== null}
            className="w-full sm:w-auto min-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 rounded-2xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300/30 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
          >
            <span className="flex items-center justify-center gap-2">
              {pending === "admin" ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opening...
                </>
              ) : (
                <>
                  Admin Dashboard
                </>
              )}
            </span>
          </motion.button>
        </motion.div>

        {/* Footer info */}
        <motion.div
          variants={itemVariants}
          className="mt-12 sm:mt-16 md:mt-20 text-xs sm:text-sm text-gray-500"
        >
          <p>Mae Fah Luang University</p>
        </motion.div>
      </motion.div>

      <div className="sr-only">
        <Link href="/user" prefetch />
        <Link href="/admin/login" prefetch />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.main>
  );
}