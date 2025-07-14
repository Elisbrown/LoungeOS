
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type TopProductsProps = {
    products: {
        name: string;
        sales: string;
        avatar: string;
        dataAiHint: string;
    }[];
}

export function TopProducts({ products }: TopProductsProps) {
  if (!products) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  return (
    <div className="space-y-8">
        {products.map((product, index) => (
            <div className="flex items-center" key={index}>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={product.avatar} alt="Avatar" data-ai-hint={product.dataAiHint} />
                    <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                </div>
                <div className="ml-auto font-medium">{product.sales}</div>
            </div>
        ))}
    </div>
  )
}
