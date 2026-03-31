export const Container = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-6">
            <div className="flex-1 min-h-0 flex flex-col">
                {children}
            </div>
        </div>
    )
}
