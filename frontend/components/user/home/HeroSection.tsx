"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTypingEffect } from "@/hooks/useTypingEffect";

export default function HeroSection() {
  const typed = useTypingEffect("find your vibe.", 60);

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24
 z-10"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Made for MFU Students
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="space-y-3"
            >
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-foreground">
                  Find your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary ml-2">
                    club
                  </span>
                </span>

                {/* 🔥 Typing Animation */}
                <span className="block text-muted-foreground text-[0.9em] mt-2 md:mt-3 typing-cursor">
                  {typed}
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Club Hub helps you discover student clubs, follow updates, and
                join activities across Mae Fah Luang University all in one
                clean, simple interface.
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-dark text-background font-semibold rounded-full px-6"
              >
                <Link href="/user/club">
                  Explore clubs
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border/70 bg-background/70 hover:bg-background/90"
              >
                <Link href="/user/activities">Browse activities</Link>
              </Button>
            </motion.div>

            {/* Bottom small features */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground"
            >
              <div>
                <div className="font-semibold text-foreground">
                  For all years
                </div>
                <div>Freshman to senior find clubs that match your vibe.</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Real-time updates
                </div>
                <div>See posts and events from clubs you care about.</div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden md:flex items-center justify-center"
          >
            <div className="relative w-64 h-64 lg:w-72 lg:h-72">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/0 blur-3xl" />
              <div className="relative w-full h-full rounded-3xl border border-border/60 bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/20">
                <Image
                  src="/brand-icon.png"
                  alt="EasyMake Logo"
                  fill
                  className="object-contain p-8"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
