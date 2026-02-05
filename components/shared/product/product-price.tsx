import { cn } from "@/lib/utils";

const ProductPrice = ({value, className}:{value:string, className?:string}) => {
    // Ensure two decimal Places
    const stringValue = parseFloat(value).toFixed(2);
    // Get The Int/FLoat
    const [initValue, floatValue] = stringValue.split('.');
    return ( 
        <p className={cn('text-2xl', className)}>
            <span className="text-xs align-super">$</span>
            <span>{initValue}</span>
            <span className="text-xs align-super">.{floatValue}</span>
        </p>
    );
}
 
export default ProductPrice;