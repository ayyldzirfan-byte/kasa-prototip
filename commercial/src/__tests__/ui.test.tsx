import { fireEvent, render, screen } from "@testing-library/react";
import { KasamCommercialApp } from "@/components/KasamCommercialApp";

describe("Kasam commercial UI", () => {
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
    expect(screen.getByText("Tatil hedefi 14 gün ileri gider")).toBeInTheDocument();
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
});
