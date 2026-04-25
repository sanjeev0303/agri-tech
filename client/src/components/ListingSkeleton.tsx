export function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="group glass rounded-[3rem] p-8 flex flex-col justify-between overflow-hidden opacity-60"
        >
          {/* Image Placeholder */}
          <div className="relative mb-8 rounded-[2rem] overflow-hidden aspect-[4/5] bg-muted/50">
            <img 
              src="https://images.unsplash.com/photo-1594776208137-aa2d9c44a2aa?q=10&w=50&blur=10"
              className="w-full h-full object-cover opacity-30"
              alt="Loading..."
              {...(i < 4 ? { fetchPriority: "high" } : {})}
            />
          </div>
          
          <div className="mb-10 space-y-4">
            <div className="space-y-2 h-14">
              <div className="h-7 bg-muted/50 rounded-xl w-3/4" />
              <div className="h-4 bg-muted/50 rounded-lg w-1/2" />
            </div>
            
            <div className="flex items-end justify-between pt-4 border-t border-border/50 h-16">
               <div className="space-y-2">
                  <div className="h-3 bg-muted/50 rounded-full w-12" />
                  <div className="h-8 bg-muted/50 rounded-xl w-24" />
               </div>
               <div className="space-y-2 text-right">
                  <div className="h-3 bg-muted/50 rounded-full w-12 ml-auto" />
                  <div className="h-6 bg-muted/50 rounded-xl w-16 ml-auto" />
               </div>
            </div>
          </div>

          <div className="h-14 bg-muted/50 rounded-2xl w-full" />
        </div>
      ))}
    </div>
  );
}
