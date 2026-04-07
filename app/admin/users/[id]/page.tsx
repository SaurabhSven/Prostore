import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";


const metadata:Metadata={
    title:"Admin User Update Page"
}

const AdminUserUpdatePage = async (props:{params:Promise<{id:string}>}) => {

    const { id } = await props.params;
    const user = await getUserById(id); 
    
    if(!user) return notFound();

    console.log(user);

    const userData = {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
    };

    return ( 
        <div className="space-y-8 max-w-lg mx-auto">
            <h1 className="h2-bold text-center">Update User</h1>

            <UpdateUserForm user={userData}/>
        </div>
    );
}
 
export default AdminUserUpdatePage;