export interface IWorkHistory {
    id?: number;
    companyName: string;
    title: string;
    overview: string;
    description: string;
    details: string[];
    technologies: string[];
    startDate: Date;
    endDate?: Date;
    created?: Date;
    updated?: Date;
}