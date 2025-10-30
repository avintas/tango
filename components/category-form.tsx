"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Switch } from "@/components/switch";
import { Alert } from "@/components/alert";
import { createSlug } from "@/lib/text-processing";
import type { Category } from "@/lib/types";
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Description,
} from "@/components/fieldset";

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
}

export default function CategoryForm({
  category,
  isEditing = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [emoji, setEmoji] = useState(category?.emoji || "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [slug, setSlug] = useState(category?.slug || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name && !isEditing) {
      setSlug(createSlug(name));
    }
  }, [name, isEditing]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const apiEndpoint = isEditing
      ? `/api/categories/${category?.id}`
      : "/api/categories";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          emoji,
          is_active: isActive,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "An unknown error occurred.");
      }

      router.push("/cms/categories");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save the category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        {error && <Alert type="error" message={error} />}
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <Label>Category Name</Label>
              <Input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Stanley Cup Playoffs"
              />
            </Field>
            <Field>
              <Label>Emoji</Label>
              <Input
                name="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="e.g., 🏒"
                maxLength={2}
              />
            </Field>
          </div>
          <Field>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="A brief description of the category."
            />
          </Field>
          <Field>
            <Label>Slug</Label>
            <Input name="slug" value={slug} disabled readOnly />
          </Field>
        </FieldGroup>
        <Field>
          <Label>Category Status</Label>
          <Switch
            name="is_active"
            checked={isActive}
            onChange={setIsActive}
            color="indigo"
          />
          <Description>
            {isActive
              ? "This category is active and will be visible."
              : "This category is inactive and will be hidden."}
          </Description>
        </Field>
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button type="button" plain onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" outline disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </div>
      </Fieldset>
    </form>
  );
}
