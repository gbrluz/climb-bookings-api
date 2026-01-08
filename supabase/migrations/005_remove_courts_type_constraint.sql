-- Remove constraint de CHECK no campo type da tabela courts
-- Isso permite que o campo aceite qualquer string (padel, tenis, areia, etc) ou NULL

DO $$
BEGIN
  -- Verificar se a tabela courts existe
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'courts'
  ) THEN

    -- Remove a constraint courts_type_check se existir
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'courts_type_check'
      AND conrelid = 'courts'::regclass
    ) THEN
      ALTER TABLE courts DROP CONSTRAINT courts_type_check;
      RAISE NOTICE 'Constraint courts_type_check removida com sucesso';
    ELSE
      RAISE NOTICE 'Constraint courts_type_check não existe';
    END IF;

    -- Garantir que o campo type existe e é TEXT (nullable)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'courts'
      AND column_name = 'type'
    ) THEN
      -- Alterar o campo type para aceitar qualquer texto
      ALTER TABLE courts ALTER COLUMN type TYPE TEXT;
      ALTER TABLE courts ALTER COLUMN type DROP NOT NULL;
      RAISE NOTICE 'Campo type atualizado para TEXT nullable';
    ELSE
      -- Criar o campo type se não existir
      ALTER TABLE courts ADD COLUMN type TEXT;
      RAISE NOTICE 'Campo type criado como TEXT nullable';
    END IF;

    COMMENT ON COLUMN courts.type IS 'Type of court: padel, tenis, areia, beach tennis, etc. Flexible string field.';

  ELSE
    RAISE NOTICE 'Tabela courts não existe';
  END IF;

END $$;
