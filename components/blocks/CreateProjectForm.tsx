"use client";
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
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useInitializeEscrow } from "./useInitializeEscrow";
import { Trash2, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
// Trustline is fixed to USDC; options no longer needed here

export const CreateProjectForm = () => {
  const {
    form,
    isSubmitting,
    milestones,
    isAnyMilestoneEmpty,
    handleSubmit,
    handleAddMilestone,
    handleRemoveMilestone,
    fillTemplateForm,
  } = useInitializeEscrow();

  const handleMilestoneAmountChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let rawValue = e.target.value;
    rawValue = rawValue.replace(/[^0-9.]/g, "");

    if (rawValue.split(".").length > 2) {
      rawValue = rawValue.slice(0, -1);
    }

    // Limit to 2 decimal places
    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
      if (parts[1] && parts[1].length > 2) {
        rawValue = parts[0] + "." + parts[1].slice(0, 2);
      }
    }

    // Always keep as string to allow partial input like "0." or "0.5"
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      amount: rawValue,
    };
    form.setValue("milestones", updatedMilestones);
  };

  // Platform fee is managed via env; no manual input

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <Link
            className="flex-1"
            href="https://docs.trustlesswork.com/trustless-work/technology-overview/escrow-types"
            target="_blank"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-xl font-semibold">Multi Release Escrow</h2>
            </div>
            <p className="text-muted-foreground mt-1">
              Fill out the form to initialize a multi release escrow
            </p>
          </Link>
          {process.env.NODE_ENV !== "production" && (
            <Button
              type="button"
              variant="outline"
              onClick={fillTemplateForm}
              className="cursor-pointer"
            >
              Autofill
            </Button>
          )}
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Title<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escrow title"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Engagement ID is generated internally; trustline fixed to USDC */}
        </div>

        {/* Wallet roles are now auto-populated from context/env; no manual inputs. */}

        {/* Platform fee and receiver memo are managed by configuration and hidden from UI. */}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Description<span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escrow description"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel className="flex items-center">
            Milestones<span className="text-destructive ml-1">*</span>
          </FormLabel>
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Milestone Description"
                  value={milestone.description}
                  className="w-full sm:w-3/5"
                  onChange={(e) => {
                    const updatedMilestones = [...milestones];
                    updatedMilestones[index].description = e.target.value;
                    form.setValue("milestones", updatedMilestones);
                  }}
                />

                <div className="relative w-full sm:w-2/5">
                  <DollarSign
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <Input
                    className="pl-10"
                    placeholder="Enter amount"
                    value={milestone.amount?.toString() || ""}
                    onChange={(e) => handleMilestoneAmountChange(index, e)}
                  />
                </div>

                <Button
                  onClick={() => handleRemoveMilestone(index)}
                  className="p-2 bg-transparent text-red-500 rounded-md border-none shadow-none hover:bg-transparent hover:shadow-none hover:text-red-500 focus:ring-0 active:ring-0 self-start sm:self-center"
                  disabled={milestones.length === 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {index === milestones.length - 1 && (
                <div className="flex justify-end mt-4">
                  <Button
                    disabled={isAnyMilestoneEmpty}
                    className="w-full md:w-1/4"
                    variant="outline"
                    onClick={handleAddMilestone}
                    type="button"
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <Button
            className="w-full md:w-1/4 cursor-pointer"
            type="submit"
            disabled={isAnyMilestoneEmpty || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Deploying...</span>
              </div>
            ) : (
              "Deploy"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
