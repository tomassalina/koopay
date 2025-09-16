import * as React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResolveDispute } from "./useResolveDispute";
import { Loader2 } from "lucide-react";

export const ResolveDisputeForm = () => {
  const { form, handleSubmit, isSubmitting } = useResolveDispute();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="approverFunds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approver Funds</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter approver funds"
                    value={field.value as unknown as string}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiverFunds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receiver Funds</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter receiver funds"
                    value={field.value as unknown as string}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Resolving...</span>
              </div>
            ) : (
              "Resolve"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
