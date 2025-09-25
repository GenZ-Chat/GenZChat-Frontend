
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Phone, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CallDialog({ 
  dialogOpen, 
  setDialogOpen, 
  handleAcceptCall, 
  handleDeclineCall,
  callerName 
}: { 
  dialogOpen: boolean; 
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>; 
  handleAcceptCall: () => void;
  handleDeclineCall?: () => void;
  callerName?: string;
}) {

  function onDeclineCall() {
    console.log("Call declined");
    if (handleDeclineCall) {
      handleDeclineCall();
    } else {
      setDialogOpen(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AnimatePresence>
        {dialogOpen && (
          <DialogContent>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 px-8 py-6 flex flex-col items-center justify-center"
            >
              <div className="mb-6 text-center">
                <span className="block text-lg font-semibold text-white mb-2">Incoming Call</span>
                <span className="block text-base text-gray-300">from <span className="font-bold">{callerName || 'Unknown Caller'}</span></span>
              </div>
              <DialogFooter className="flex flex-row gap-6 justify-center w-full mt-4">
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg bg-red-600/90 hover:bg-red-700 text-white text-base font-medium"
                    onClick={onDeclineCall}
                  >
                    <PhoneOff className="w-5 h-5" /> Decline
                  </Button>
                </DialogClose>
                <Button
                  variant="default"
                  className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg bg-green-600/90 hover:bg-green-700 text-white text-base font-medium"
                  onClick={handleAcceptCall}
                >
                  <Phone className="w-5 h-5" /> Accept
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}