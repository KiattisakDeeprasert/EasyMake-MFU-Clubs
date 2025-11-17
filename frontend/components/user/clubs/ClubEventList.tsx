"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicActivity } from "@/services/clubsService";

export type ClubEventsListProps = {
  activities: PublicActivity[];
  onToggleRegister: (
    activityId: string,
    currentlyRegistered: boolean
  ) => void | Promise<void>;
  loadingActivityId?: string | null;
};

export default function ClubEventsList({
  activities,
  onToggleRegister,
  loadingActivityId,
}: ClubEventsListProps) {
  const list = useMemo(
    () =>
      [...activities].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ),
    [activities]
  );

  if (!list.length) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="p-12 text-center space-y-4">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">No Upcoming Events</h3>
            <p className="text-muted-foreground">
              Follow this club to get notified.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {list.map((event, i) => {
        const isRegistered = !!event.is_registered;
        const isFull = event.registered >= event.capacity;
        const isLoading = loadingActivityId === event._id;
        const isLocked = (event as any).registration_locked_for_me === true;

        return (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="bg-surface border-border overflow-hidden hover:border-primary transition-all group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={(event.images && event.images[0]) || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <Badge className="absolute top-3 right-3 bg-primary text-background border-0 capitalize">
                  {event.status}
                </Badge>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {new Date(event.start_time).toLocaleString()}
                      {event.end_time
                        ? ` - ${new Date(event.end_time).toLocaleString()}`
                        : ""}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {event.registered}/{event.capacity} registered
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {isLocked ? (
                    <p className="text-xs text-muted-foreground italic">
                      You already registered and cancelled this activity. You
                      cannot register again.
                    </p>
                  ) : (
                    <Button
                      className={
                        isRegistered
                          ? "bg-muted text-foreground hover:bg-muted/80"
                          : "bg-primary text-background hover:bg-primary/90"
                      }
                      disabled={isLoading || (!isRegistered && isFull)}
                      onClick={() => onToggleRegister(event._id, isRegistered)}
                    >
                      {isLoading
                        ? "Processing..."
                        : isRegistered
                        ? "Cancel Registration"
                        : isFull
                        ? "Full"
                        : "Register"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
