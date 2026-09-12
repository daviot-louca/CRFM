import MainLayout from "../../../components/layout/MainLayout"
import TableauCompagnie from "../components/TableauCompagnie"

function CompagniesAdmin() {
  return (
    <MainLayout>
      <div className="w-full min-w-0">
        <TableauCompagnie />
      </div>
    </MainLayout>
  )
}

export default CompagniesAdmin