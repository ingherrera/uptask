import { Link, useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";
import { useForm } from "react-hook-form";
import type { Project, ProjectFormData } from "@/types/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/api/ProjectAPI";
import { toast } from "react-toastify";

type EditProjectFormProps = {
  data: ProjectFormData;
  projectId: Project["id"];
};

export default function EditProjectForm({ data, projectId }: EditProjectFormProps) {
  const navigate = useNavigate();
  const {register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      projectName: data.projectName,
      clientName: data.clientName,
      description: data.description
    }
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["updateProject"],
    mutationFn: updateProject,
    // Codigo en caso de presentarse un Error en la Actualizacion
    onError: () => {},
    // Codigo si la Actualizacion tuvo Exito
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getProjectById", projectId] });
      toast.success(data);
      navigate("/");
    },
  });


  const handleForm = (formData: ProjectFormData) => {
    // const data = { formData, projectId };
    // mutate(data);
    mutate({formData, projectId});
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black">Editar Proyecto</h1>
        <p className="text-2xl font-light text-gray-500 mt-5">
          Llena el siguiente formulario para editar el proyecto
        </p>
        <nav className="my-5 ">
          <Link
            className=" bg-purple-400 hover:bg-purple-500 px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
            to="/">
            Volver a Proyectos
          </Link>
        </nav>
        <form
          onSubmit={handleSubmit(handleForm)}
          className="mt-10 bg-white shadow-lg p-10 rounded-lg">
          <ProjectForm
            register={register}
            errors={errors}
          />
          <input
            className=" bg-fuchsia-600 hover:bg-fuchsia-700 w-full p-3 text-white uppercase font-bold cursor-pointer transition-colors"
            type="submit"
            value="Guardar Cambios"
          />
        </form>
      </div>
    </>
  );
}
