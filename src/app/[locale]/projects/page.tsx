'use client';

import { ProjectModal }  from "@/components";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";

interface Project {
    title: string;
    subtitle: string;
    engSub: string;
    viSub: string;
    description: string;
    engDes: string;
    viDes: string;
    url: string;
    github: string;
    technologies: string[];
    education: boolean;
    development: boolean;
    thumb: string;
    gallery: string[];
    team: Array<{
        name: string;
        role: string;
        responsibilities: string;
    }>;
}

export default function ProjectsPage() {
    const locale = useLocale();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('/projects.json')
            .then((res) => res.json())
            .then((data) => {
                setProjects(data.projects);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error loading projects:', error);
                setIsLoading(false);
            });
    }, []);

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProject(null), 300);
    };

    const getLocalizedSubtitle = (project: Project) => {
        if (locale === 'ja') return project.subtitle;
        if (locale === 'vi') return project.viSub;
        return project.engSub;
    };

    return (
        <>
            <main className="w-full pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Loading state */}
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="text-white">Loading...</div>
                        </div>
                    ) : (
                        /* Grid 3 cols */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                            {projects.map((project, index) => {
                                const subtitle = getLocalizedSubtitle(project);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleProjectClick(project)}
                                        className="relative overflow-hidden! rounded-3xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-400 ease-in-out cursor-pointer scroll-animate scroll-fade-up"
                                        style={{
                                            aspectRatio: "4 / 3",
                                            animationDelay: `${Math.min(index * 100, 600)}ms`,

                                        }}
                                    >
                                        {/* Background image */}
                                        <div
                                            className="absolute inset-0 bg-cover overflow-hidden rounded-3xl bg-center blur-[2px]"
                                            style={{
                                                backgroundImage: `url('${project.thumb}')`,
                                            }}
                                        />

                                        {/* Blur overlay */}
                                        <div className="absolute inset-0 bg-black/20 overflow-hidden" />

                                        {/* Content */}
                                        <div className="relative h-full p-6 flex flex-col justify-end text-white">
                                            {/* Title */}
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                                                    {project.title}
                                                </h2>
                                                <p className="text-md text-white line-clamp-2 mb-4">
                                                    {subtitle}
                                                </p>
                                            </div>

                                            {/* Technologies */}
                                            <div className="flex flex-wrap gap-2">
                                                {project.technologies.map((tech: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-purple-800/70 text-purple-100 text-xs font-semibold rounded-full border border-white/30"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <ProjectModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
}
