
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/context/settings-context"

type TopProductsProps = {
    products: {
        id: string;
        name: string;
        category: string;
        image: string;
        totalSold: number;
        totalRevenue: number;
    }[];
}

export function TopProducts({ products }: TopProductsProps) {
  const { settings } = useSettings();
  
  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground">No products sold yet</div>;
  }
  
  return (
    <div className="space-y-8">
        {products.map((product, index) => (
            <div className="flex items-center" key={product.id}>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={product.image} alt={product.name} />
                    <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-sm font-medium">{product.totalSold} sold</div>
                    <div className="text-xs text-muted-foreground">
                        {formatCurrency(product.totalRevenue, settings.defaultCurrency)}
                    </div>
                </div>
            </div>
        ))}
    </div>
  )
}
