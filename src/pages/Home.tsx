import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BeforeInstallPromptEvent } from "@/types";

function Home() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSDialog, setShowIOSDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    if (isIOS) {
      setShowIOSDialog(true);
    }
  }, [isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log("No install prompt available");
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        navigate("/timer");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Error showing install prompt:", err);
    }
  };

const showIOSInstallInstructions = () => {
    setShowIOSDialog(true);
}
  return (
    <>
      <div className="flex flex-col flex-1 h-full items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Timer PWA</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {!isIOS && deferredPrompt && (
              <Button onClick={handleInstall} size="lg">
                Instalar App
              </Button>
            )}
            {isIOS && (
              <Button onClick={showIOSInstallInstructions} size="lg">
                Como instalar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Para installar en iOS (Solo desde Safari)
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="mt-2 flex flex-col flex-1 items-center gap-2">
                <span>1. Busque el boton de Compartir</span>
                <span>
                  2. Presione el boton y busque la opcion de Añadir a inicio
                </span>
                <span>3. De click a Añadir en la esquina superior derecha</span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Home;
