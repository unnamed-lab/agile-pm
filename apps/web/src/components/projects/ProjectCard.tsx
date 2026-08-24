"use client";

import Link from "next/link";
import { CheckSquare, Zap, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    members: Array<{
      role: string;
      user: { id: string; name: string; avatarUrl?: string | null };
    }>;
    _count: { tasks: number; sprints: number };
  };
}

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-purple-500",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProjectCard({ project }: ProjectCardProps) {
  const activeSprints = project._count.sprints;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-emerald-500/40 transition-all flex flex-col h-full min-h-[180px]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors text-sm">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <AnimatedIcon
            icon={ArrowRight}
            animation="hover-scale"
            size={16}
            className="text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5"
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono">{project._count.tasks}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono">{activeSprints}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-mono">{project.members.length}</span>
          </div>

          {/* Avatar stack */}
          {project.members.length > 0 && (
            <div className="flex -space-x-1.5 ml-auto">
              {project.members.slice(0, 4).map((member) => (
                <div
                  key={member.user.id}
                  className={`w-6 h-6 rounded-full ${avatarColor(member.user.name)} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white shadow-sm`}
                  title={member.user.name}
                >
                  {getInitials(member.user.name)}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-2 ring-white">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
