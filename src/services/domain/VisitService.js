export default class VisitService {
    constructor(visitRepo) {
        this.visitRepo = visitRepo;
    }

    async getPerformanceMetrics() {
        const weeklyVisits = await this.visitRepo.getWeeklyVisits();
        const effectiveCount = weeklyVisits.filter(v => v.is_effective).length;
        const totalCount = weeklyVisits.length;
        const rate = totalCount > 0 ? Math.round((effectiveCount / totalCount) * 100) : 0;

        return {
            weeklyVisits: totalCount,
            effectiveVisits: effectiveCount,
            rate
        };
    }

    async getScheduledToday() {
        return await this.visitRepo.getTodayVisits();
    }
}
