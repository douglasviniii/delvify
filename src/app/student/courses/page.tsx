

export default function StudentCoursesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Você ainda não possui cursos.</h2>
                    <p className="text-muted-foreground mt-2">
                        Explore nossa biblioteca de cursos e comece a aprender hoje mesmo!
                    </p>
                </div>
            </div>
        </div>
    )
}
