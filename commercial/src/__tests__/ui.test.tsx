import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPanel, KasamCommercialApp } from "@/components/KasamCommercialApp";

describe("Kasam commercial UI", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("renders the five-tab product spine", () => {
    render(<KasamCommercialApp />);
    expect(screen.getByText("Ana ekran")).toBeInTheDocument();
    expect(screen.getByText("Hareketler")).toBeInTheDocument();
    expect(screen.getByText("Bütçeler")).toBeInTheDocument();
    expect(screen.getByText("Takvim")).toBeInTheDocument();
    expect(screen.getByText("Rapor")).toBeInTheDocument();
  });

  test("renders compact financial recommendations", async () => {
    render(<KasamCommercialApp />);
    expect(await screen.findByText("Kasam öneriyor")).toBeInTheDocument();
    expect(await screen.findByText("Akıllı yönlendirme")).toBeInTheDocument();
    expect(screen.getByText("Fişten yemek fikri")).toBeInTheDocument();
    expect(screen.getByText("İzin olmadan kapalı")).toBeInTheDocument();
    expect(screen.getByText(/Tatil hedefi \d+ gün ileri gider/)).toBeInTheDocument();
    expect(screen.queryByText("Allah verdi")).not.toBeInTheDocument();
  });

  test("add movement flow stays compact", () => {
    render(<KasamCommercialApp />);
    fireEvent.click(screen.getByText("Hareket ekle"));
    expect(screen.getByLabelText("Hareket ekle")).toBeInTheDocument();
    expect(screen.queryByText("Aşama 1")).not.toBeInTheDocument();
    expect(screen.getByText("Paylaşılacak kişiler")).toBeInTheDocument();
  });

  test("notification game keeps details hidden from actor", () => {
    render(<KasamCommercialApp />);
    fireEvent.click(screen.getByText("Hareketler"));
    expect(screen.getByText("Gizli hareket")).toBeInTheDocument();
    expect(screen.queryByText("Tahmin et")).not.toBeInTheDocument();
  });

  test("prediction feedback animates selected media before reveal", async () => {
    window.history.pushState({}, "", "/?visualTest=1&visualUser=2");
    render(<KasamCommercialApp />);

    fireEvent.click(screen.getByText("Hareketler"));
    fireEvent.click(await screen.findByText("Tahmin et"));

    expect(await screen.findByRole("dialog", { name: "Tahmin sonucu" })).toBeInTheDocument();
    expect(screen.getByText("Do\u011fru bildin")).toBeInTheDocument();
    expect(screen.getByTestId("guess-reaction-media")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Devam"));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Tahmin sonucu" })).not.toBeInTheDocument());
  });

  test("auth fields keep typing local and submit once", () => {
    const onSubmit = jest.fn();
    const onPasswordReset = jest.fn();

    render(
      <AuthPanel
        authMode="sign-in"
        cloudBusy={false}
        statusMessage=""
        onAuthModeChange={jest.fn()}
        onSubmit={onSubmit}
        onPasswordReset={onPasswordReset}
        onOpenDemo={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("mail@adres.com"), { target: { value: "irfan@kasam.test" } });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), { target: { value: "12345678" } });

    expect(screen.getByPlaceholderText("mail@adres.com")).toHaveValue("irfan@kasam.test");
    expect(screen.getByPlaceholderText("Şifre")).toHaveValue("12345678");
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Giriş yap"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      authMode: "sign-in",
      email: "irfan@kasam.test",
      password: "12345678",
      name: ""
    });
  });
});
