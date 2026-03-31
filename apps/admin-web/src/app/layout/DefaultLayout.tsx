import { Outlet } from "react-router";
import { Container, useToggle } from "@mercado/shared-ui";
import { Header, Sidebar } from "../components";
import { useGenerateNavigationItems } from "../hooks";

export const DefaultLayout = () => {
  const { isActive, toggle } = useToggle();
  const { NavigationItems } = useGenerateNavigationItems({ isActive });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        <Sidebar isActive={isActive} toggle={toggle}>
          {NavigationItems}
        </Sidebar>
        <div className="flex-1 min-w-0 flex flex-col">
          <Header />
          <Container>
            <Outlet />
          </Container>
        </div>
      </div>
    </div>
  );
};
