"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ClubPublic } from "@/services/clubsService";

type Props = {
  clubs: ClubPublic[];
  loading: boolean;
  error?: string | null;
};

export default function FeaturedClubsSection({ clubs, loading, error }: Props) {
  return (
    <section className="relative py-20 z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold">
            Featured <span className="text-primary">Clubs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore all active student organizations at Mae Fah Luang University.
          </p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && clubs.length === 0 && (
          <div className="text-center text-gray-500">No clubs found.</div>
        )}

        {!loading && !error && clubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {clubs.map((club, i) => (
              <motion.div
                key={club._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <Link href={`/user/club/${club._id}`}>
                  <Card className="bg-background border-border hover:border-primary transition-all duration-300 overflow-hidden group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={club.cover_image_url || "/placeholder.svg"}
                        alt={club.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    <CardContent className="p-6 space-y-2">
                      <div className="text-xs text-primary font-medium capitalize">
                        {club.status}
                      </div>
                      <h3 className="font-semibold text-xl">{club.name}</h3>
                      {club.tagline && (
                        <p className="text-sm text-muted-foreground">{club.tagline}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {club.followerCount
                            ? `${club.followerCount} members`
                            : "No member info"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
