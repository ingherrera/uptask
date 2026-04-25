import { getProjectTeam } from "@/api/TeamAPI";
import AddMemberModal from "@/components/team/AddMemberModal";
import ListMembersTeam from "@/components/team/ListMembersTeam";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function ProjectTeamView() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = +params.projectId!;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getprojectTeam", projectId],
    queryFn: () => getProjectTeam({ projectId }),
    retry: false,
  });

  if (isLoading) return "Cargando...";
  // if (isError) return <Navigate to={"/404"} />;
  if (isError) {
    console.log({ error });
    return <p>Hubo un error</p>;
  }

  console.log({ data });
  // Quitamos la prop "user" por considerarla innecesaria

  if (data)
    return (
      <>
        <h1 className="text-5xl font-black">Administrar Equipo</h1>
        <p className="text-2xl font-light text-gray-500 mt-5">
          Administra el equipo de trabajo para este proyecto
        </p>
        <nav className="my-5 flex gap-3">
          <button
            type="button"
            className="bg-purple-400 hover:bg-purple-500 px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors"
            onClick={() => navigate(location.pathname + "?addMember=true")}>
            Agregar Colaborador
          </button>

          <Link
            to={`/projects/${projectId}`}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 px-10 py-3 text-white text-xl font-bold cursor-pointer transition-colors">
            Volver a Proyecto
          </Link>
        </nav>
        <ListMembersTeam data={data} />
        <AddMemberModal />
      </>
    );
}
